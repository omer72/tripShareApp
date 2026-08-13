import Capacitor

/// App-local plugins aren't auto-discovered — register them as the bridge loads.
class ViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NearbyPlugin())
    }
}
