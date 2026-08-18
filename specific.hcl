# Finali / Briefd — infrastructure definition (specific.dev)
#
# Local development: `specific dev` starts the Next.js app with env injected.
# Deploy:            `specific deploy` builds and ships the web service.
#
# Note: the /api/orchestrate route drives a locally installed Adobe InDesign
# over AppleScript and therefore only functions in local development on macOS.
# Everything else (marketing page, Briefd, /api/parse) is cloud-deployable.

build "web" {
  base    = "node"
  command = "npm run build"
}

service "web" {
  build   = build.web
  command = "npm start"

  endpoint {
    public = true
  }

  env = {
    PORT = port
  }

  dev {
    command = "npm run dev"
  }
}
