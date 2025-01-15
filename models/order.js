import { Schema, model, ObjectId } from 'mongoose'

const cartSchema = new Schema({
  product: {
    type: ObjectId,
    ref: 'products',
    required: [true, 'userCartProductRequired'],
  },
  quantity: {
    type: Number,
    required: [true, 'userCartQuantityRequired'],
    min: [1, 'userCartQuantityTooSmall'],
  },
})

const schema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'users',
      required: [true, 'orderUserRequired'],
    },
    cart: {
      type: [cartSchema],
      required: [true, 'orderCartRequired'],
      validate: {
        validator(value) {
          return value.length > 0
        },
        message: 'orderCartEmpty',
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('orders', schema)
