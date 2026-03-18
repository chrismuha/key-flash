window.RESTAURANT1_OWNER_CONFIG = {
  defaultBusinessLocationId: 'default',
  businessLocations: {
    default: {
      id: 'default',
      label: 'John Doe | 123 Placeholder Ave | Sampletown, NY 10000',
      name: 'John Doe',
      address: '123 Placeholder Ave',
      cityStateZip: 'Sampletown, NY 10000',
      phone: '(315) 555-0101'
    }
  },
  sectionLabels: {
    pizza: 'Pizza',
    burger: 'Burger',
    calzone: 'Calzone',
    chicken_wings: 'Chicken Wings',
    salad: 'Salad',
    sub: 'Sub',
    wrap: 'Wrap',
    sauces: 'Sauces'
  },
  pizzaSizeLabels: {
    small: 'Small',
    medium: 'Medium',
    large: 'Large'
  },
  menuSections: [
    {
      id: 'burger',
      label: 'Burger',
      ingredients: [
        { value: 'bacon', label: 'Bacon' },
        { value: 'bun', label: 'Bun', required: true },
        { value: 'cheese', label: 'Cheese' },
        { value: 'jalapenos', label: 'Jalapeños' },
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'medium_well', label: 'Medium-Well' },
        { value: 'mushrooms', label: 'Mushrooms' },
        { value: 'olives', label: 'Olives' },
        { value: 'onion', label: 'Onion' },
        { value: 'patty', label: 'Patty', required: true },
        { value: 'pickles', label: 'Pickles' },
        { value: 'rare', label: 'Rare' },
        { value: 'tomato_sauce', label: 'Sauce' },
        { value: 'tomatoes', label: 'Tomatoes' },
        { value: 'well_done', label: 'Well-Done' }
      ]
    },
    {
      id: 'calzone',
      label: 'Calzone',
      ingredients: [
        { value: 'american_cheese', label: 'American Cheese' },
        { value: 'bacon_bits', label: 'Bacon Bits' },
        { value: 'banana_peppers', label: 'Banana Peppers' },
        { value: 'black_pepper', label: 'Black Pepper' },
        { value: 'broccoli', label: 'Broccoli' },
        { value: 'cheddar_cheese', label: 'Cheddar Cheese' },
        { value: 'eggplant', label: 'Eggplant' },
        { value: 'feta_cheese', label: 'Feta Cheese' },
        { value: 'garlic_powder', label: 'Garlic Powder' },
        { value: 'grated_parmesan_or_pecorino', label: 'Grated Parmesan or Pecorino' },
        { value: 'greens', label: 'Greens' },
        { value: 'green_peppers', label: 'Green Peppers' },
        { value: 'ham', label: 'Ham' },
        { value: 'hot_peppers', label: 'Hot Peppers' },
        { value: 'jalapenos', label: 'Jalapeño' },
        { value: 'italian_seasoning', label: 'Italian Seasoning' },
        { value: 'meatballs', label: 'Meatballs' },
        { value: 'mushrooms', label: 'Mushrooms' },
        { value: 'olive_oil', label: 'Olive Oil' },
        { value: 'onion', label: 'Onion' },
        { value: 'pepperoni', label: 'Pepperoni' },
        { value: 'pineapple', label: 'Pineapple' },
        { value: 'ricotta_cheese', label: 'Ricotta Cheese' },
        { value: 'roasted_red_peppers', label: 'Roasted Red Peppers' },
        { value: 'salami', label: 'Salami' },
        { value: 'sausage', label: 'Sausage' },
        { value: 'salt', label: 'Salt' },
        { value: 'shredded_mozzarella', label: 'Shredded Mozzarella' },
        { value: 'spinach', label: 'Spinach' },
        { value: 'steak', label: 'Steak' },
        { value: 'swiss_cheese', label: 'Swiss Cheese' },
        { value: 'tomatoes', label: 'Tomatoes' }
      ]
    },
    {
      id: 'chicken_wings',
      label: 'Chicken Wings',
      ingredients: [
        { value: 'butter_sauce', label: 'Butter Sauce' },
        { value: 'garlic', label: 'Garlic' },
        { value: 'honey', label: 'Honey' },
        { value: 'hot_and_spicy_barbecue_sauce', label: 'Hot and Spicy Barbecue Sauce' },
        { value: 'hot_sauce', label: 'Hot Sauce' },
        { value: 'medium_sauce', label: 'Medium Sauce' },
        { value: 'mild_sauce', label: 'Mild Sauce' },
        { value: 'mustard', label: 'Mustard' },
        { value: 'plain', label: 'Plain', required: true },
        { value: 'extra_hot_sauce', label: 'Extra Hot Sauce' },
        { value: 'spicy_garlic_parm_sauce', label: 'Spicy Garlic Parm Sauce' }
      ],
      sectionQtySelect: {
        label: 'Wing Count',
        options: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        suffix: ' Wings'
      }
    },
    {
      id: 'pizza',
      label: 'Pizza',
      pizzaSizes: ['small', 'medium', 'large'],
      ingredients: [
        { value: 'bacon', label: 'Bacon' },
        { value: 'cheese', label: 'Cheese' },
        { value: 'cherry_peppers', label: 'Cherry Peppers' },
        { value: 'feta_cheese', label: 'Feta Cheese' },
        { value: 'green_peppers', label: 'Green Peppers' },
        { value: 'ham', label: 'Ham' },
        { value: 'jalapenos', label: 'Jalapeños' },
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'mushrooms', label: 'Mushrooms' },
        { value: 'olives', label: 'Olives' },
        { value: 'onion', label: 'Onion' },
        { value: 'pickles', label: 'Pickles' },
        { value: 'pineapple', label: 'Pineapples' },
        { value: 'roasted_peppers', label: 'Roasted Peppers' },
        { value: 'spinach', label: 'Spinach' },
        { value: 'thincrust', label: 'Thin Crust' },
        { value: 'tomatoes', label: 'Tomatoes' },
        { value: 'tomato_sauce', label: 'Tomato Sauce', required: true },
        { value: 'well_done', label: 'Well-Done' }
      ]
    },
    {
      id: 'salad',
      label: 'Salad',
      ingredients: [
        { value: 'banana_peppers', label: 'Banana Peppers' },
        { value: 'croutons', label: 'Croutons' },
        { value: 'cucumbers', label: 'Cucumbers' },
        { value: 'green_peppers', label: 'Green Peppers' },
        { value: 'ham', label: 'Ham' },
        { value: 'italian_dressing', label: 'Italian Dressing' },
        { value: 'olives', label: 'Olives' },
        { value: 'provolone_cheese', label: 'Provolone Cheese' },
        { value: 'red_onion', label: 'Red Onion' },
        { value: 'red_peppers', label: 'Red Peppers' },
        { value: 'salami', label: 'Salami' },
        { value: 'tomato', label: 'Tomato' }
      ]
    },
    {
      id: 'sauces',
      label: 'Sauces',
      ingredients: [
        { value: 'bbq', label: 'BBQ' },
        { value: 'butter_milk_ranch', label: 'Butter Milk Ranch' },
        { value: 'honey_bbq', label: 'Honey BBQ' },
        { value: 'honey_mustard', label: 'Honey Mustard' },
        { value: 'mayonnaise', label: 'Mayonnaise' },
        { value: 'mustard', label: 'Mustard' },
        { value: 'ranch', label: 'Ranch' }
      ]
    },
    {
      id: 'sub',
      label: 'Sub',
      ingredients: [
        { value: 'bacon', label: 'Bacon' },
        { value: 'bologna', label: 'Bologna' },
        {
          value: 'white',
          label: 'Bread',
          required: true,
          noQty: true,
          inputId: 'sub-bread-checkbox',
          selectId: 'sub-bread-select',
          selectAriaLabel: 'Choose bread',
          options: [
            { value: 'white', label: 'White' },
            { value: 'wheat', label: 'Wheat' }
          ]
        },
        { value: 'cheese', label: 'Cheese' },
        { value: 'ham', label: 'Ham' },
        { value: 'jalapenos', label: 'Jalapeños' },
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'mushrooms', label: 'Mushrooms' },
        { value: 'olives', label: 'Olives' },
        { value: 'onion', label: 'Onion' },
        { value: 'pepperoni', label: 'Pepperoni' },
        { value: 'pickles', label: 'Pickles' },
        { value: 'salami', label: 'Salami' },
        { value: 'toasted', label: 'Toasted' },
        { value: 'tomatoes', label: 'Tomatoes' },
        { value: 'turkey', label: 'Turkey' }
      ]
    },
    {
      id: 'wrap',
      label: 'Wrap',
      ingredients: [
        { value: 'bacon', label: 'Bacon' },
        { value: 'bologna', label: 'Bologna' },
        {
          value: 'white',
          label: 'Tortilla',
          required: true,
          noQty: true,
          inputId: 'wrap-bread-checkbox',
          selectId: 'wrap-bread-select',
          selectAriaLabel: 'Choose tortilla',
          options: [
            { value: 'white', label: 'White' },
            { value: 'wheat', label: 'Wheat' },
            { value: 'tomato_basil', label: 'Tomato Basil' },
            { value: 'spinach', label: 'Spinach' }
          ]
        },
        { value: 'cheese', label: 'Cheese' },
        { value: 'ham', label: 'Ham' },
        { value: 'jalapenos', label: 'Jalapeños' },
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'mushrooms', label: 'Mushrooms' },
        { value: 'olives', label: 'Olives' },
        { value: 'onion', label: 'Onion' },
        { value: 'pepperoni', label: 'Pepperoni' },
        { value: 'pickles', label: 'Pickles' },
        { value: 'salami', label: 'Salami' },
        { value: 'tomatoes', label: 'Tomatoes' },
        { value: 'turkey', label: 'Turkey' }
      ]
    }
  ],
  ingredientLabels: {},
  sectionIngredientCategories: {},
  presetsBySection: {}
};
