using Microsoft.AspNetCore.Mvc;

namespace MShop.Controllers
{
    public class CartController : Controller
    {
        public IActionResult CartPage()
        {
            return View();
        }
    }
}
