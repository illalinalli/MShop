using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MShop.Models
{
    public class Item
    {
        public ObjectId Id { get; set; }
        public string? Title { get; set; }
        public bool IsPublished { get; set; }
        public List<byte[]>? Images { get; set; }
        public ObjectId BreedRef { get; set; }
        public List<ObjectId>? Properties { get; set; }
        public string? LongDescription { get; set; }
        public DateTimeOffset? CreationDate { get; set; }
        public double Price { get; set; }

        [BsonIgnore]
        public int Quantity { get; set; }
        public Item()
        {
            Id = ObjectId.GenerateNewId();
        }

    }
}
