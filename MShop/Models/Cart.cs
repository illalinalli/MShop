using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MShop.Models
{
    public class Cart
    {
        public ObjectId Id { get; set; }
        public ObjectId UserRef { get; set; }
        public List<ObjectId> Items { get; set; } = new();

        [BsonIgnore]
        public List<Item> CartItems { get; set; } = new();
        public Cart() {
            Id = ObjectId.GenerateNewId();
        }

        //public void AddToCart(Item item)
        //{
        //    Items.Add(item.Id);
        //}

        public void AddToCart(Item item)
        {
            var existingItem = CartItems.FirstOrDefault(i => i.Id == item.Id);
            if (existingItem != null)
            {
                existingItem.Quantity++;
            }
            else
            {
                CartItems.Add(new Item
                {
                    Id = item.Id,
                    Title = item.Title,
                    Price = item.Price,
                    Quantity = 1
                });
            }
        }

        public void RemoveItem(Item item)
        {
            var existingItem = CartItems.FirstOrDefault(i => i.Id == item.Id);
            if (existingItem != null)
            {
                CartItems.Remove(existingItem);
            }
        }

        public void QuantityDecrement(ObjectId itemId)
        {
            var item = CartItems.FirstOrDefault(i => i.Id == itemId);
            if (item != null)
            {
                if (item.Quantity > 1)
                {
                    item.Quantity--;
                }
                else
                {
                    CartItems.Remove(item);
                }
            }
        }

        public decimal CalculateTotal()
        {
            return (decimal)CartItems.Sum(i => i.Price * i.Quantity);
        }
    }
}
