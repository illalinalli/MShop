using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using MShop.Models;
using System.Diagnostics;
using System.Security.Claims;
using static MShop.Models.Database;
using MongoDB.Driver;
using MongoDB.Bson;

namespace MShop.Controllers
{
    public class HomeController : Controller
    {
        public static User? CurUser;
        public static Cart? UserCart = new();
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult MainPage()
        {
            return View();
        }

        // магазин
        public IActionResult ShopPage()
        {
            return View();
        }

        public IActionResult Login()
        {
            //LoginModel model = new();
            User user = new();
            return View("Login", user);
        }

        [HttpPost]
        public async Task<IActionResult> Login(string Login, string Password)
        {
            if (ModelState.IsValid)
            {
                //MainPage mainPageModel = new();

                var httpContext = HttpContext;
                //var s = UserCollection?.Find(new BsonDocument()).ToList();
                var user = UserCollection?.Find(x => x.Login == Login).FirstOrDefault();
                //mainPageModel.CurUser = user;
                CurUser = user;
                // проверяем на правильность логина и пароля пользователя
                if (user != null)
                {
                    var hash = GetHash(Password);
                    if (user.Password == hash)
                    {
                        var claims = new List<Claim>() { new Claim(ClaimTypes.Name, user.Login) };
                        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                        AuthenticationProperties authProps = new()
                        {
                            IsPersistent = true
                        };
                        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity), authProps);

                        return RedirectToAction("MainPage", "Home");
                    }
                    else
                    {
                        ModelState.AddModelError("", "Неправильный пароль.");
                    }
                }
                else
                {
                    ModelState.AddModelError("", "Такого пользователя не существует.");
                }
            }
            return View();
        }

        public IActionResult Registration()
        {
            User user = new();
            return View("Registration", user);
        }

        [HttpPost]
        public async Task<IActionResult> Registration(string Name, string Login, string Password)
        {
            if (ModelState.IsValid && Login != null && Name != null && Password != null)
            {
                //var httpContext = HttpContext;
                var hash = GetHash(Password);

                User user = new()
                {
                    Id = ObjectId.GenerateNewId(),
                    Name = Name,
                    Login = Login,
                    Password = hash,
                    Favorites = new()
                };
                // добавляем пользователя в БД
                var filter = Builders<User>.Filter.Eq("_id", user.Id);

                // выполнение операции upsert
                UserCollection?.ReplaceOneAsync(filter, user, ReplaceOptionsUpsert);

                CurUser = user;

                var claims = new List<Claim>() { new Claim(ClaimTypes.Name, user.Login) };

                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

                AuthenticationProperties authProps = new()
                {
                    IsPersistent = true
                };
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity), authProps);
                return RedirectToAction("MainPage", "Home");
            }
            return View();
        }

        public IActionResult FavoritesPage()
        {
            return View();
        }

        public async Task<IActionResult> Logout()
        {
            CurUser = new();
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Redirect("Login");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}