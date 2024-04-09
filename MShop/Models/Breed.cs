using MongoDB.Bson;

namespace MShop.Models
{
    public class Breed
    {
        public ObjectId Id { get; set; }
        public string Name { get; set; }
        public ObjectId AnimalTypeRef { get; set; }

        public override string ToString()
        {
            return Name;
        }
    }
}
