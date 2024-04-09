using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
namespace MShop.Controllers
{
    public class AdvertisementController : Controller
    {
        public IActionResult AdvertisementView()
        {
            return View("AdvertisementView");
        }

        // подробные описания публикации
        public IActionResult AdvertisementDetailView()
        {
            return View("AdvertisementDetailView");
        }
    }
}
