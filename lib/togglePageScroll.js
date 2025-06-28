const togglePageScroll = (allowScroll) => {
  const html = document.documentElement
  const body = document.body
  if (allowScroll) {
    html.style.overflow = ""
    body.style.overflow = ""
    html.style.height = ""
    body.style.height = ""
  } else {
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    html.style.height = "100%"
    body.style.height = "100%"
  }
}

export default togglePageScroll