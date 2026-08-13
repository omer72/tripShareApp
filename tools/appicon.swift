import AppKit

// Generates both brand images from one layout:
//   swift tools/appicon.swift icon <out.png>     1024px app icon
//   swift tools/appicon.swift splash <out.png>   2732px launch image
// The mosaic is the app's shape — nine tiles — with a country in each one.
let mode = CommandLine.arguments[1]
let out = CommandLine.arguments[2]
let splash = mode == "splash"
let px = splash ? 2732 : 1024
let size = Double(px)

let flags = ["🇵🇹", "🇪🇸", "🇮🇹",
             "🇬🇷", "🇮🇱", "🇫🇷",
             "🇺🇸", "🇲🇽", "🇹🇭"]

let paper = NSColor(red: 0.953, green: 0.945, blue: 0.921, alpha: 1)
let ink = NSColor(red: 0.063, green: 0.075, blue: 0.078, alpha: 1)

let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: px, pixelsHigh: px,
                           bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                           colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)

paper.setFill()
NSRect(x: 0, y: 0, width: size, height: size).fill()

// The launch image is centred in a much larger square, so the mosaic is a
// fraction of it rather than edge to edge.
let block = splash ? size * 0.34 : size - 152
let gap = block * 0.022
let cell = (block - gap * 2) / 3

let probe = NSAttributedString(string: flags[0], attributes: [.font: NSFont(name: "Apple Color Emoji", size: 100)!])
let font = NSFont(name: "Apple Color Emoji", size: 100 * (cell / probe.size().width))!
let drawn = NSAttributedString(string: flags[0], attributes: [.font: font]).size()
let rowStep = drawn.height * 0.74

// Splash leaves room under the mosaic for the wordmark.
let centre = splash ? size / 2 + size * 0.05 : size / 2
let left = (size - block) / 2

for (i, flag) in flags.enumerated() {
    let col = Double(i % 3), row = Double(i / 3)
    NSAttributedString(string: flag, attributes: [.font: font])
        .draw(at: NSPoint(x: left + col * (cell + gap) + (cell - drawn.width) / 2,
                          y: centre + rowStep - row * rowStep - drawn.height / 2))
}

if splash {
    let title = NSAttributedString(string: "MetroMosaic", attributes: [
        .font: NSFont.systemFont(ofSize: size * 0.052, weight: .bold),
        .foregroundColor: ink,
        .kern: -size * 0.0012,
    ])
    let box = title.size()
    title.draw(at: NSPoint(x: (size - box.width) / 2, y: centre - rowStep * 2.1 - box.height))
}

NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
