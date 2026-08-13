import AppKit

// The mosaic, but each tile is a country instead of a colour block. Flags are
// scaled to the tile they sit in, so they still read at 60pt on a home screen.
let px = 1024
let size = Double(px)
let flags = ["🇵🇹", "🇪🇸", "🇮🇹",
             "🇬🇷", "🇯🇵", "🇫🇷",
             "🇲🇦", "🇲🇽", "🇹🇭"]

let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: px, pixelsHigh: px,
                           bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                           colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)

NSColor(red: 0.953, green: 0.945, blue: 0.921, alpha: 1).setFill()  // --paper
NSRect(x: 0, y: 0, width: size, height: size).fill()

let margin = 76.0, gap = 18.0
let cell = (size - margin * 2 - gap * 2) / 3

// Measure once at a known size, then scale so a flag spans its whole tile.
let probe = NSAttributedString(string: flags[0], attributes: [.font: NSFont(name: "Apple Color Emoji", size: 100)!])
let unit = probe.size()
let font = NSFont(name: "Apple Color Emoji", size: 100 * (cell / unit.width))!
let drawn = NSAttributedString(string: flags[0], attributes: [.font: font]).size()
// Rows hug the flags rather than their square tiles — emoji flags are wide.
let rowStep = drawn.height * 0.74
let top = size / 2 + rowStep

for (i, flag) in flags.enumerated() {
    let col = Double(i % 3), row = Double(i / 3)
    let text = NSAttributedString(string: flag, attributes: [.font: font])
    text.draw(at: NSPoint(x: margin + col * (cell + gap) + (cell - drawn.width) / 2,
                          y: top - row * rowStep - drawn.height / 2))
}

NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
