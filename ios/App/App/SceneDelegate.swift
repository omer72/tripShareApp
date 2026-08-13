import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = ViewController()  // registers app-local plugins
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
        hand(connectionOptions.urlContexts)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
        hand(URLContexts)
    }

    /// A sent link is an https one so anyone can open it in a browser. If the app
    /// is installed, the web page hands the same payload over as
    /// metromosaic://open#l=…, and the fragment goes straight to the webview —
    /// the app already renders whatever is in its hash.
    private func hand(_ contexts: Set<UIOpenURLContext>) {
        guard let url = contexts.first?.url, url.scheme == "metromosaic",
              let fragment = url.fragment, fragment.hasPrefix("l=") else { return }
        deliver(fragment, tries: 60)
    }

    /// On a cold start the webview isn't up yet, so keep trying while it loads.
    private func deliver(_ fragment: String, tries: Int) {
        guard tries > 0 else { return }
        let controller = window?.rootViewController as? CAPBridgeViewController
        guard let webView = controller?.bridge?.webView, !webView.isLoading else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { self.deliver(fragment, tries: tries - 1) }
            return
        }
        // Base64url payload — nothing in it can close the string literal.
        webView.evaluateJavaScript("location.hash = '#\(fragment)'")
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
