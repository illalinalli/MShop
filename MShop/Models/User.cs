using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;
namespace MShop.Models
{
    public class User
    {
        public ObjectId Id { get; set; }
        public string? Name { get; set; }

        [BindProperty]
        [Required]
        public string? Login { get; set; }

        [BindProperty]
        [Required]
        public string? Password { get; set; }

        public List<ObjectId> Favorites { get; set; } = new();
    }
}
