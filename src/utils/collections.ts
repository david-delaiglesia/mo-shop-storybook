export const groupBy = <CollectionItemType>(
  collection: CollectionItemType[],
  property: keyof CollectionItemType,
  keyModifierFunction?: (value: unknown) => string,
) =>
  collection.reduce(
    (groups, item) => {
      const key = keyModifierFunction
        ? keyModifierFunction(item[property])
        : item[property]
      groups[key as string] = groups[key as string] || []
      groups[key as string].push(item)
      return groups
    },
    {} as Record<string, CollectionItemType[]>,
  )

export const getUniqueBy = <CollectionItemType>(
  collection: CollectionItemType[],
  property: keyof CollectionItemType,
) =>
  collection.reduce((acc, item) => {
    const key = item[property]
    if (!acc.find((i) => i[property] === key)) {
      acc.push(item)
    }
    return acc
  }, [] as CollectionItemType[])

export const getUniqueById = <
  CollectionItemType extends { id: string | number },
>(
  collection: CollectionItemType[],
) => getUniqueBy(collection, 'id')
