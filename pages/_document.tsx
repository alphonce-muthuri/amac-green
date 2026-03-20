import Document, { Head, Html, Main, NextScript } from "next/document"

// Minimal pages-router Document.
// Even though this project primarily uses the `app/` router, Next's prerender/export
// pipeline expects `/pages/_document` to exist during `next build`.
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

