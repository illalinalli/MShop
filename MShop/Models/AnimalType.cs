using MongoDB.Bson;

namespace MShop.Models
{
    public class AnimalType
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }

        public override string ToString()
        {
            return Name;
        }
    }
}
