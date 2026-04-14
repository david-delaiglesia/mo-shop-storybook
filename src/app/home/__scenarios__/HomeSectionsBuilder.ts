export class HomeSectionsBuilder {
  private readonly sections: unknown[] = []

  withSection(section: unknown) {
    this.sections.push(section)
    return this
  }

  build() {
    return {
      sections: this.sections,
    }
  }
}
