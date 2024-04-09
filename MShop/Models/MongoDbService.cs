using MongoDB.Driver;
using System;
namespace MShop.Models
{
    public class MongoDbService
    {
        private IMongoDatabase _database;

        public MongoDbService(string connectionString, string databaseName)
        {
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string collectionName)
        {
            return _database.GetCollection<T>(collectionName);
        }
    }
}
