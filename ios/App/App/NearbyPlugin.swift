import AVFoundation
import Capacitor
import MapKit

/// Turns a coordinate into the names of the places you're standing in, so saving
/// is one line of typing. MapKit does this locally — no API key, no HTTP call.
@objc(NearbyPlugin)
public class NearbyPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NearbyPlugin"
    public let jsName = "Nearby"
    public let pluginMethods: [CAPPluginMethod] = [
        .init(name: "lookup", returnType: CAPPluginReturnPromise),
        .init(name: "showMap", returnType: CAPPluginReturnPromise),
        .init(name: "scanCode", returnType: CAPPluginReturnPromise)
    ]

    /// Every place on one MapKit map. The map comes up straight away; places with
    /// no coordinates are looked up one at a time and drop in as they land.
    /// MKLocalSearch, not CLGeocoder — a business name inside an address string
    /// defeats the geocoder, and it throttles after a couple of calls.
    @objc func showMap(_ call: CAPPluginCall) {
        let places = (call.getArray("places") as? [[String: Any]]) ?? []
        let pins: [Pin] = places.map {
            Pin(key: $0["key"] as? String ?? "",
                name: $0["name"] as? String ?? "",
                note: $0["note"] as? String ?? "",
                address: $0["address"] as? String ?? "",
                city: $0["city"] as? String ?? "",
                mine: $0["mine"] as? Bool ?? true,
                coordinate: coordinate(($0["latitude"] as? NSNumber)?.doubleValue,
                                       ($0["longitude"] as? NSNumber)?.doubleValue))
        }
        DispatchQueue.main.async {
            guard let host = self.bridge?.viewController else {
                call.reject("No view controller to present the map from")
                return
            }
            let screen = MapScreen(pins: pins) { located in
                // Only what we had to look up is worth sending back.
                call.resolve(["located": located.map {
                    ["key": $0.key, "latitude": $0.coordinate!.latitude, "longitude": $0.coordinate!.longitude]
                }])
            }
            screen.modalPresentationStyle = .fullScreen
            host.present(screen, animated: true)
        }
    }

    /// Points the camera at a QR code — an Instagram nametag, usually — and hands
    /// back whatever it holds. AVFoundation reads codes on its own; no dependency.
    @objc func scanCode(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let host = self.bridge?.viewController else {
                call.reject("No view controller to present the scanner from")
                return
            }
            let screen = ScannerScreen { value in
                if let value {
                    call.resolve(["value": value])
                } else {
                    call.reject("Nothing scanned")
                }
            }
            screen.modalPresentationStyle = .fullScreen
            host.present(screen, animated: true)
        }
    }

    private func coordinate(_ lat: Double?, _ lon: Double?) -> CLLocationCoordinate2D? {
        guard let lat, let lon else { return nil }
        return CLLocationCoordinate2D(latitude: lat, longitude: lon)
    }

    @objc func lookup(_ call: CAPPluginCall) {
        guard let lat = call.getDouble("latitude"), let lon = call.getDouble("longitude") else {
            call.reject("latitude and longitude are required")
            return
        }
        let here = CLLocation(latitude: lat, longitude: lon)
        let request = MKLocalPointsOfInterestRequest(center: here.coordinate, radius: 150)

        MKLocalSearch(request: request).start { response, _ in
            let nearest = (response?.mapItems ?? []).sorted {
                ($0.placemark.location?.distance(from: here) ?? .greatestFiniteMagnitude)
                    < ($1.placemark.location?.distance(from: here) ?? .greatestFiniteMagnitude)
            }
            // City and country ride along so the form can file the place without typing.
            let suggestions = nearest.prefix(6).map { item in
                ["name": item.name ?? "", "address": Self.oneLine(item.placemark),
                 "city": item.placemark.locality ?? "", "country": item.placemark.country ?? ""]
            }
            if !suggestions.isEmpty {
                call.resolve(["suggestions": suggestions])
                return
            }
            // Nothing recognisable nearby — fall back to the street address.
            CLGeocoder().reverseGeocodeLocation(here) { placemarks, error in
                guard let placemark = placemarks?.first else {
                    call.reject(error?.localizedDescription ?? "Nothing found at this location")
                    return
                }
                call.resolve(["suggestions": [["name": "", "address": Self.oneLine(placemark),
                                               "city": placemark.locality ?? "", "country": placemark.country ?? ""]]])
            }
        }
    }

    struct Pin {
        let key: String, name: String, note: String, address: String, city: String
        let mine: Bool
        var coordinate: CLLocationCoordinate2D?
    }

    private static func oneLine(_ p: CLPlacemark) -> String {
        let street = [p.thoroughfare, p.subThoroughfare].compactMap { $0 }.joined(separator: " ")
        return [street, p.subLocality ?? p.locality ?? ""]
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
    }
}

/// The map itself: every pin at once, yours in orange, shared ones in green.
/// Tapping a callout hands off to Maps, which does directions better than we would.
class MapScreen: UIViewController, MKMapViewDelegate {
    private let map = MKMapView()
    private var pins: [NearbyPlugin.Pin]
    private let onLocated: ([NearbyPlugin.Pin]) -> Void
    private var found: [NearbyPlugin.Pin] = []
    private let status = UILabel()

    init(pins: [NearbyPlugin.Pin], onLocated: @escaping ([NearbyPlugin.Pin]) -> Void) {
        self.pins = pins
        self.onLocated = onLocated
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("not used") }

    override func viewDidLoad() {
        super.viewDidLoad()
        map.frame = view.bounds
        map.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        map.delegate = self
        view.addSubview(map)

        let done = UIButton(type: .system)
        done.setTitle("Done", for: .normal)
        done.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        done.backgroundColor = UIColor(white: 1, alpha: 0.92)
        done.layer.cornerRadius = 17
        done.frame = CGRect(x: 16, y: 62, width: 78, height: 34)
        done.autoresizingMask = [.flexibleBottomMargin, .flexibleRightMargin]
        done.addTarget(self, action: #selector(close), for: .touchUpInside)
        view.addSubview(done)

        status.frame = CGRect(x: 104, y: 62, width: view.bounds.width - 120, height: 34)
        status.autoresizingMask = [.flexibleWidth, .flexibleBottomMargin]
        status.font = .systemFont(ofSize: 14, weight: .medium)
        status.textColor = UIColor(white: 0.1, alpha: 1)
        status.backgroundColor = UIColor(white: 1, alpha: 0.92)
        status.layer.cornerRadius = 17
        status.layer.masksToBounds = true
        status.textAlignment = .center
        view.addSubview(status)

        // Anything already located goes up before the first lookup returns.
        pins.filter { $0.coordinate != nil }.forEach(drop)
        frame()
        lookUp(pins.filter { $0.coordinate == nil })
    }

    /// One search at a time — parallel MapKit searches get throttled, and the pins
    /// appearing one by one reads as progress rather than a hang.
    private func lookUp(_ rest: [NearbyPlugin.Pin]) {
        var rest = rest
        guard var pin = rest.first else {
            status.text = nil
            status.isHidden = true
            onLocated(found)
            return
        }
        rest.removeFirst()
        status.isHidden = false
        status.text = "Finding \(pin.name)…"

        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = [pin.name, pin.address, pin.city]
            .filter { !$0.isEmpty }.joined(separator: ", ")
        if let region = map.annotations.isEmpty ? nil : map.region as MKCoordinateRegion? {
            request.region = region
        }
        MKLocalSearch(request: request).start { [weak self] response, _ in
            guard let self else { return }
            if let where_ = response?.mapItems.first?.placemark.coordinate {
                pin.coordinate = where_
                self.found.append(pin)
                self.drop(pin)
                self.frame()
            }
            self.lookUp(rest)
        }
    }

    private func drop(_ pin: NearbyPlugin.Pin) {
        guard let coordinate = pin.coordinate else { return }
        let a = Annotation()
        a.coordinate = coordinate
        a.title = pin.name
        a.subtitle = pin.note
        a.mine = pin.mine
        map.addAnnotation(a)
    }

    private func frame() {
        guard !map.annotations.isEmpty else { return }
        map.showAnnotations(map.annotations, animated: false)
    }

    @objc private func close() { dismiss(animated: true) }

    class Annotation: MKPointAnnotation { var mine = true }

    func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
        guard let a = annotation as? Annotation else { return nil }
        let view = mapView.dequeueReusableAnnotationView(withIdentifier: "p") as? MKMarkerAnnotationView
            ?? MKMarkerAnnotationView(annotation: a, reuseIdentifier: "p")
        view.annotation = a
        view.canShowCallout = true
        view.markerTintColor = a.mine
            ? UIColor(red: 0.886, green: 0.333, blue: 0.169, alpha: 1)   // --orange
            : UIColor(red: 0.106, green: 0.369, blue: 0.294, alpha: 1)   // --green
        view.rightCalloutAccessoryView = UIButton(type: .detailDisclosure)
        return view
    }

    func mapView(_ mapView: MKMapView, annotationView: MKAnnotationView, calloutAccessoryControlTapped: UIControl) {
        guard let a = annotationView.annotation as? Annotation else { return }
        let item = MKMapItem(placemark: MKPlacemark(coordinate: a.coordinate))
        item.name = a.title ?? ""
        item.openInMaps()
    }
}


/// Full-screen camera that resolves on the first code it sees, or on Cancel.
class ScannerScreen: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    private let session = AVCaptureSession()
    private let done: (String?) -> Void
    private var answered = false

    init(done: @escaping (String?) -> Void) {
        self.done = done
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("not used") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        guard let camera = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: camera),
              session.canAddInput(input) else {
            finish(nil)
            return
        }
        session.addInput(input)

        let output = AVCaptureMetadataOutput()
        guard session.canAddOutput(output) else {
            finish(nil)
            return
        }
        session.addOutput(output)
        output.setMetadataObjectsDelegate(self, queue: .main)
        output.metadataObjectTypes = [.qr]

        let preview = AVCaptureVideoPreviewLayer(session: session)
        preview.frame = view.bounds
        preview.videoGravity = .resizeAspectFill
        view.layer.addSublayer(preview)

        let hint = UILabel(frame: CGRect(x: 24, y: view.bounds.height - 160, width: view.bounds.width - 48, height: 44))
        hint.text = "Point at the Instagram nametag"
        hint.textAlignment = .center
        hint.textColor = .white
        hint.font = .systemFont(ofSize: 16, weight: .medium)
        view.addSubview(hint)

        let cancel = UIButton(type: .system)
        cancel.setTitle("Cancel", for: .normal)
        cancel.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        cancel.backgroundColor = UIColor(white: 1, alpha: 0.92)
        cancel.layer.cornerRadius = 17
        cancel.frame = CGRect(x: 16, y: 62, width: 88, height: 34)
        cancel.addTarget(self, action: #selector(cancelled), for: .touchUpInside)
        view.addSubview(cancel)

        DispatchQueue.global(qos: .userInitiated).async { self.session.startRunning() }
    }

    @objc private func cancelled() { finish(nil) }

    func metadataOutput(_ output: AVCaptureMetadataOutput,
                        didOutput objects: [AVMetadataObject],
                        from connection: AVCaptureConnection) {
        guard let code = objects.compactMap({ ($0 as? AVMetadataMachineReadableCodeObject)?.stringValue }).first
        else { return }
        finish(code)
    }

    /// Camera off and one answer only — the delegate fires repeatedly while running.
    private func finish(_ value: String?) {
        guard !answered else { return }
        answered = true
        if session.isRunning { session.stopRunning() }
        dismiss(animated: true) { self.done(value) }
    }
}
