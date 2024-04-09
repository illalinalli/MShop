using MongoDB.Bson;

namespace MShop.Models
{
    public class PropertyValue
    {
        public ObjectId Id { get; set; }
        public string? Name { get; set; }
        public ObjectId PropTypeRef { get; set; }

    }
}
