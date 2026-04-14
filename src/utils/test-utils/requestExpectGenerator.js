export const expectedRequest = ({ url, method, body }) => {
  return expect.objectContaining({
    url: expect.stringContaining(url),
    method,
    _bodyInit: JSON.stringify(body),
  })
}
