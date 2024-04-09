using MShop.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.JSInterop;
using System.Net;
using System.Text.Encodings.Web;
using System.Text.Unicode;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var configuration = builder.Configuration;

Database DB = new Database();
// Add services to the container.

builder.Services.AddControllersWithViews();
builder.Services.AddServerSideBlazor(); // options => { options.DetailedErrors = true; }
// add cookies
services.AddDistributedMemoryCache();
services.AddRazorPages();
services.AddServerSideBlazor(options => { options.DetailedErrors = true; });
HtmlEncoder DefaultHtmlEncoder = HtmlEncoder.Create(allowedRanges: new[] {
    UnicodeRanges.All
});

//Utils.HtmlEncoder = DefaultHtmlEncoder;
//services.AddSingleton(DefaultHtmlEncoder);

services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(o =>
    {
        o.LoginPath = new PathString("/Login");
        o.AccessDeniedPath = new PathString("/AccessDenied");
        o.SlidingExpiration = false;
    });

//builder.Services.AddRadzenComponents();
var app = builder.Build();
app.UseRouting();
//app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

var provider = new FileExtensionContentTypeProvider();
provider.Mappings["{EXTENSION}"] = "{CONTENT TYPE}";

app.UseStaticFiles(new StaticFileOptions { ContentTypeProvider = provider });
app.UseStaticFiles();
// Configure the HTTP request pipeline.
/*if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}*/

/*services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromSeconds(10);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});*/

app.UseHttpsRedirection();
/*app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});*/
app.UseEndpoints(endpoints =>
{
    endpoints.MapBlazorHub();
    endpoints.MapControllers();
    /*endpoints.MapControllerRoute(
        name: "actionDiplom",
        pattern: "/{action}/{id?}"
        );*/
    endpoints.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=MainPage}/{id?}");
    //endpoints.MapBlazorHub();
});

app.Run();
