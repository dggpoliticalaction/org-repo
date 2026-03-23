const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const iceoutRedirect = {
    source: '/iceout/:state*',
    destination: 'https://iceout.org/en/location/report',
    permanent: false,
  }

  const redirects = [internetExplorerRedirect, iceoutRedirect]

  return redirects
}

export default redirects
