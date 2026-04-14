export const openCart = async (component) => {
  const cartButton = await component.asyncFind('[aria-label="cart.aria_open"]')
  cartButton.simulate('click')
}
