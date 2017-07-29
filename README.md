# flame-http
Simple HTTP server that accepts JSON and sends UDP to a flame panel backend

# Usage
`node index --backend [address] [options]`

Options:
  --backend   Address of the flamepanel backend server                [required]
  --backport  Port that the flamepanel backend is running on     [default: 1075]
  --port      Port to run the HTTP server on                     [default: 8080]
  --webroot   The root for web-accessible content, if desired