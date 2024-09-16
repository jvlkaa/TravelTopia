using backend_app.Dto;
using backend_app.Models;
using backend_app.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend_app.Controllers
{
    [Route("TravelTopia/[controller]")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly UserService userService;
        private readonly RouteService routeService;

        public UserController(UserService userService) 
        { 
            this.userService = userService;
        }


        [HttpPost("login")]
        public async Task<IActionResult> GoogleLogin([FromBody] string idToken)
        {
            Console.WriteLine(idToken);
            var payload = await VerifyGoogleToken(idToken);
            if (payload == null)
                return BadRequest("Invalid Google token.");

            var user = await userService.GetUserByGoogleIdAsync(payload.Subject);
            if (user == null)
            {
                user = new User
                {
                    googleId = payload.Subject,
                    role = "user",
                    firstName = payload.GivenName,
                    lastName = payload.FamilyName,
                    email = payload.Email,
                };
                await userService.CreateUserAsync(user);
            }

            return Ok();
        }

        private async Task<GoogleJsonWebSignature.Payload> VerifyGoogleToken(string idToken)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string> { "594811329058-f3i591f9al5a22i3sbghck3mv4j0ia2h.apps.googleusercontent.com" }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            return payload;
        }

        [HttpGet("{user}/RouteIds")]
        public async Task<IActionResult> GetRoutesByString(string user)
        {
            var payload = await VerifyGoogleToken(user);
            var result = await userService.getRoutesFromUserAsync(payload.Subject);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpPost("addRoute")]
        public async Task<IActionResult> AddRoute([FromBody] UserIdRouteId data)
        {
            var payload = await VerifyGoogleToken(data.user);
            await userService.AddRouteAsync(payload.Subject, data.route);
            return NoContent();
        }

        [HttpPost("addNewRoute")]
        public async Task<IActionResult> AddNewRoute([FromBody] AddUserRoute route)
        {
            var payload = await VerifyGoogleToken(route.userIdToken);
            if(await routeService.addUserRoute(route))
            {
                await userService.AddRouteAsync(payload.Subject, route.id);
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }


        [HttpPost("deleteRoute")]
        public async Task<IActionResult> DeleteRoute([FromBody] UserIdRouteId data)
        {
            var payload = await VerifyGoogleToken(data.user);
            await userService.DeleteRouteAsync(payload.Subject, data.route);
            return NoContent();
        }

        [HttpGet("userRole/{googleId}")]
        public async Task<IActionResult> GetRole(string googleId)
        {
            var payload = await VerifyGoogleToken(googleId);
            var result = await userService.GetRoleAsync(payload.Subject);
            if(result == string.Empty)
            {
                return NotFound();
            }
            else
            {
                return Content(result, "text/plain"); //return Ok(result);
            }
        }

        [HttpPost("updateRole/{googleId}")]
        public async Task<IActionResult> UpdateRole(string googleId)
        {
            var payload = await VerifyGoogleToken(googleId);
            await userService.UpdateRoleAsync(payload.Subject);
            return NoContent();
        }
    }
}
