using MongoDB.Bson;
using MongoDB.Driver;
using System.Text;

namespace MShop.Models
{
    public class Database
    {
        public static IMongoDatabase? DB;
        public static IMongoCollection<User>? UserCollection;
        public static IMongoCollection<Item>? ItemCollection;
        public static IMongoCollection<Breed>? BreedCollection;
        public static IMongoCollection<AnimalType>? AnimalTypeCollection;
        public static IMongoCollection<PropertyType>? PropertyTypeCollection;
        public static IMongoCollection<PropertyValue>? PropertyValueCollection;
        public static string GetHash(string password)
        {
            var sha = System.Security.Cryptography.SHA1.Create();
            var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return hash.Aggregate("", (string s, byte b) => s + b.ToString("x2"));
        }
        public static void HashPassword()
        {
            var users = UserCollection.Find(new BsonDocument()).ToList();
            foreach (var user in users)
            {
                var hash = GetHash(user.Password);
                user.Password = hash;
                var filter = Builders<User>.Filter.Eq("_id", user.Id);
                UserCollection?.ReplaceOne(filter, user, ReplaceOptionsUpsert);
            }
        }
        public Database()
        {
            var connectionString = "mongodb://localhost:27017";
            var client = new MongoClient(connectionString);
            DB = client.GetDatabase("MonkeyShop");
            UserCollection = DB.GetCollection<User>("User");
            ItemCollection = DB.GetCollection<Item>("Item");
            BreedCollection = DB.GetCollection<Breed>("Breed");
            AnimalTypeCollection = DB.GetCollection<AnimalType>("AnimalType");
            PropertyTypeCollection = DB.GetCollection<PropertyType>("PropertyType");
            PropertyValueCollection = DB.GetCollection<PropertyValue>("PropertyValue");
            //HashPassword();
        }

        public static readonly ReplaceOptions ReplaceOptionsUpsert = new() { IsUpsert = true };
    }
}
