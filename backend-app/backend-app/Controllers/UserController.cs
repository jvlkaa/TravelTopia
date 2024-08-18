using backend_app.Models;
using backend_app.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;

namespace backend_app.Controllers
{
    [Route("TravelTopia/[controller]")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly UserService userService;

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
                    firstName = payload.GivenName,
                    lastName = payload.FamilyName,
                    email = payload.Email,
                };
                await userService.CreateUserAsync(user);
            }

            // Tutaj możesz wygenerować własny token JWT dla aplikacji
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
    }
}
