class Menu {
  constructor(name, price, description, image) {
    this.name = name;
    this.price = price;
    this.description = description;
    this.image = image;
  }

  static createMenu(payload, image) {
    return new Account(
      payload.name?.trim(),
      payload.price?.trim(),
      payload.description,
      image
    );
  }
}

export default Menu;
