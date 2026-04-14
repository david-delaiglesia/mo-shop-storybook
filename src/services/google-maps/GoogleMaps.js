const getMap = (node, options) => {
  return new window.google.maps.Map(node, options)
}

const searchNearby = async (request) => {
  return await window.google.maps.places.Place.searchNearby(request)
}

const searchNearbyDistanceRankPreference = async () => {
  const { SearchNearbyRankPreference } =
    await window.google.maps.importLibrary('places')

  return SearchNearbyRankPreference.DISTANCE
}

const getMapBounds = (southwestViewPort, northeastViewPort) => {
  return new window.google.maps.LatLngBounds(
    southwestViewPort,
    northeastViewPort,
  )
}

export const GoogleMaps = {
  getMap,
  getMapBounds,
  searchNearby,
  searchNearbyDistanceRankPreference,
}
