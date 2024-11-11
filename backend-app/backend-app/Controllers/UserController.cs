using backend_app.Dto;
using backend_app.Models;
using backend_app.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Runtime.CompilerServices;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend_app.Controllers
{
    [Route("TravelTopia/[controller]")]
    [ApiController]
    public class UserController : Controller
    {
        private readonly UserService userService;
        private readonly RouteService routeService;
        private readonly TripService tripService;

        public UserController(UserService userService, RouteService routeService, TripService tripService)
        {
            this.userService = userService;
            this.routeService = routeService;
            this.tripService = tripService;
        }


        [HttpPost("login")]
        public async Task<IActionResult> GoogleLogin([FromBody] string idToken)
        {
            var payload = await VerifyGoogleToken(idToken);
            if (payload == null)
                return BadRequest("Invalid Google token.");

            var user = await userService.GetUserByGoogleIdAsync(payload.Subject);
            if (user == null)
            {
                user = new User
                {
                    googleId = payload.Subject,
                    role = (payload.Email == "traveltopiadeveloper@gmail.com" ? "developer" : "user"),
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

        [HttpGet("{user}/routesFilter")]
        public async Task<IActionResult> GetFilteredRoutes(string user, [FromQuery] string? name = null, string? type = null, string? difficulty = null)
        {
            var payload = await VerifyGoogleToken(user);
            var userRoutes = await userService.getRoutesFromUserAsync(payload.Subject);

            var result = await routeService.GetFilteredUserRoutesAsync(userRoutes, name, type, difficulty);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("{user}/tripsFilter")]
        public async Task<IActionResult> GetFilteredTrips(string user, [FromQuery] string? name = null, [FromQuery] string? difficulty = null)
        {
            var payload = await VerifyGoogleToken(user);
            var userTrips = await userService.getTripsFromUserAsync(payload.Subject);

            var result = await tripService.GetFilteredUserTripsAsync(userTrips, name, difficulty);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("{user}/TripIds")]
        public async Task<IActionResult> GetTripsByString(string user)
        {
            var payload = await VerifyGoogleToken(user);
            var result = await userService.getTripsFromUserAsync(payload.Subject);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("NearUserPoint/{latitude}/{longitude}")]
        public async Task<IActionResult> GetRoutesByPoint(double latitude, double longitude, [FromQuery] List<string> routes)
        {
            var result = await routeService.GetUserRoutesByPointAsync(routes, latitude, longitude);
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

            if (await routeService.addUserRoute(route))
            {
                var newRoute = await routeService.GetRouteAsync(route.name);
                await userService.AddRouteAsync(payload.Subject, newRoute.id);

                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost("addTrip")]
        public async Task<IActionResult> addTrip([FromBody] UserIdTripId data)
        {
            var payload = await VerifyGoogleToken(data.user);
            await userService.AddTripAsync(payload.Subject, data.trip);
            return NoContent();
        }

        [HttpPost("addNewTrip")]
        public async Task<IActionResult> AddNewTrip([FromBody] AddUserTrip trip)
        {
            var payload = await VerifyGoogleToken(trip.userIdToken);

            if (await tripService.AddUserTrip(trip))
            {
                var newTrip = await tripService.GetTripAsync(trip.name);
                await userService.AddTripAsync(payload.Subject, newTrip.id);

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

            var route = await routeService.GetRouteByIdAsync(data.route);

            if (route.userCreated == true)
            {
                var result = await routeService.deleteRouteAsync(route.id);
                if(result == false)
                {
                    return NotFound();
                }
            }

            return NoContent();
        }

        [HttpPost("deleteTrip")]
        public async Task<IActionResult> DeleteTrip([FromBody] UserIdTripId data)
        {
            var payload = await VerifyGoogleToken(data.user);
            await userService.DeleteTripAsync(payload.Subject, data.trip);

            var trip = await tripService.GetTripByIdAsync(data.trip);

            if (trip.userCreated == true) 
            {
                var result = await tripService.deleteTripAsync(trip.id);
                if (result == false)
                {
                    return NotFound();
                }
            }
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
