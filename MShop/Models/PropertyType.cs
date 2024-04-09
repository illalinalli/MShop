using MongoDB.Bson;

namespace MShop.Models
{
    public class PropertyType
    {
        public ObjectId Id { get; set; }
        public string? Name { get; set; } // окрас
    }
}
