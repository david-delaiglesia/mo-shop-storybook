import {
  capitalizeFirstLetter,
  capitalizeString,
  clearLastWhiteSpaces,
  containsLetters,
  containsNumbers,
  containsOnlySpaces,
  containsSpecificWord,
  containsSymbols,
  containsUpperCase,
  haveSpecificLength,
  isAsciiPrintable,
  onlyContainsNumbers,
} from '../strings'

describe('strings utils its', () => {
  const mockedString = 'string'
  const containNumber = 'str1ng'
  const numbersString = '1234'

  it('capitalizeFirstLetter', () => {
    const expectedResult = 'String'

    const result = capitalizeFirstLetter(mockedString)

    expect(result).toBe(expectedResult)
  })

  it('capitalizeString', () => {
    const expectedResult = 'STRING'

    const result = capitalizeString(mockedString)

    expect(result).toBe(expectedResult)
  })

  describe('containsSpecificWord', () => {
    const witheSpaceString = '  '
    const mockedWord = 'word'
    const mockedWordInString = 'ng'

    it.each`
      string          | word                  | expected | it
      ${mockedString} | ${undefined}          | ${false} | ${'dont call with word'}
      ${mockedString} | ${witheSpaceString}   | ${false} | ${'word length is null'}
      ${mockedString} | ${mockedWord}         | ${false} | ${'string dont contain word'}
      ${mockedString} | ${mockedWordInString} | ${true}  | ${'string contain word'}
    `('return $expected if $it', ({ string, word, expected }) => {
      const result = containsSpecificWord(string, word)

      expect(result).toBe(expected)
    })
  })

  describe('containsLetters method', () => {
    it('return true if string contains any letter', () => {
      const stringContainsLetters = containsLetters(mockedString)

      expect(stringContainsLetters).toBeTruthy()
    })

    it('return false if string not contains any letter', () => {
      const stringContainsLetters = containsLetters(numbersString)

      expect(stringContainsLetters).toBeFalsy()
    })
  })

  describe('containsNumbers method', () => {
    it('return true if string contains any number', () => {
      const stringContainsNumber = containsNumbers(containNumber)

      expect(stringContainsNumber).toBeTruthy()
    })

    it('return false if string not contains any number', () => {
      const stringContainsNumber = containsNumbers(mockedString)

      expect(stringContainsNumber).toBeFalsy()
    })
  })

  describe('onlyContainsNumbers method', () => {
    it('return true if string only contains numbers ', () => {
      const stringContainsOnlyNumbers = onlyContainsNumbers(numbersString)

      expect(stringContainsOnlyNumbers).toBeTruthy()
    })

    it('return false if string not contains only numbers', () => {
      const stringContainsOnlyNumbers = onlyContainsNumbers(mockedString)

      expect(stringContainsOnlyNumbers).toBeFalsy()
    })
  })

  describe('containsSymbols method', () => {
    const symbolsString = '#12ab'

    it('return true if string contains any symbol', () => {
      const stringContainsSymbol = containsSymbols(symbolsString)

      expect(stringContainsSymbol).toBeTruthy()
    })

    it('return false if string not contains any number', () => {
      const stringContainsSymbol = containsSymbols(mockedString)

      expect(stringContainsSymbol).toBeFalsy()
    })
  })

  describe('containsUpperCase method', () => {
    const upperCaseString = 'stRing'

    it('return true if string contains any upperCase letter', () => {
      const stringContainsUpperCase = containsUpperCase(upperCaseString)

      expect(stringContainsUpperCase).toBeTruthy()
    })

    it('return false if string not contains any upperCase letter', () => {
      const stringContainsUpperCase = containsUpperCase(mockedString)

      expect(stringContainsUpperCase).toBeFalsy()
    })
  })

  describe('containsOnlySpaces method', () => {
    const spacesString = '   '

    it('return true if string contains any white space', () => {
      const stringContainsOnlySpaces = containsOnlySpaces(spacesString)

      expect(stringContainsOnlySpaces).toBeTruthy()
    })

    it('return false if string not contains only white spaces', () => {
      const stringContainsOnlySpaces = containsOnlySpaces(mockedString)

      expect(stringContainsOnlySpaces).toBeFalsy()
    })
  })

  it('should clearLastWhiteSpaces return string without last withe spaces', () => {
    const stringWithSpaces = `${mockedString}   `

    const result = clearLastWhiteSpaces(stringWithSpaces)

    expect(result).toBe(mockedString)
  })

  describe('haveSpecificLength', () => {
    it.each`
      string          | length                     | expected | it
      ${mockedString} | ${mockedString.length}     | ${true}  | ${'have specific length'}
      ${mockedString} | ${mockedString.length - 1} | ${false} | ${'has less length'}
      ${mockedString} | ${mockedString.length + 1} | ${false} | ${'has more length'}
    `('return $expected if string $it', ({ string, length, expected }) => {
      const result = haveSpecificLength(string, length)

      expect(result).toBe(expected)
    })
  })

  describe('isAsciiPrintable', () => {
    describe('when all its content is ASCII printable', () => {
      it('should return true', () => {
        const letters = 'ThisIsAnAsciiPrintableString'

        const areAsciiPrintableLetters = isAsciiPrintable(letters)

        expect(areAsciiPrintableLetters).toBeTruthy()
      })
    })

    describe('when some of its content is not ASCII printable', () => {
      it('should return false', () => {
        const letters =
          'This is a not ASCII printable string because it contains spaces'

        const areAsciiPrintableLetters = isAsciiPrintable(letters)

        expect(areAsciiPrintableLetters).toBeFalsy()
      })
    })
  })
})
