export class ResponsesBuilder {
  #requests = []

  _addRequest(request) {
    this.#requests.push(request)
  }

  build() {
    const currentRequests = [...this.#requests]
    this.#requests = []
    return currentRequests
  }
}
