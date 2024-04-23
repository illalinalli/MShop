using MongoDB.Bson;

namespace MShop.Models
{
    public class Cart
    {
        public ObjectId Id { get; set; }
        public ObjectId UserRef { get; set; }
        public List<ObjectId> Items { get; set; } = new();

        public Cart() {
            Id = ObjectId.GenerateNewId();
        }

        public void AddToCart(Item item)
        {
            Items.Add(item.Id);
        }
    }
}
