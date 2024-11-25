const whiteList = [
  "back_default",
  "back_female",
  "back_shiny",
  "back_shiny_female",
  "front_default",
  "front_female",
  "front_shiny",
  "front_shiny_female",
];

function keyIsInWhiteList(key) {
  return whiteList.includes(key);
}

function valueIsNotNull(value) {
  return !!value;
}

function spritesOnlyDefault(spriteResponse) {
  const asArray = Object.entries(spriteResponse);

  const transformedResponse = asArray
    .filter(([key, value]) => valueIsNotNull(value))
    .filter(([key, value]) => keyIsInWhiteList(key));
  return Object.fromEntries(transformedResponse);
}

module.exports = spritesOnlyDefault;
