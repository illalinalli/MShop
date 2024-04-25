using MongoDB.Bson;

namespace MShop.Models
{
    public class Order
    {
        public ObjectId Id { get; set; }
        public ObjectId UserRef { get; set; }
        public List<ObjectId> ItemRefs { get; set; }
        public decimal TotalPrice { get; set; }

        public Order() {
            Id = ObjectId.GenerateNewId();
        }
    }
}
