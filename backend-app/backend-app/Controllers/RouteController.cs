using backend_app.Dto;
using backend_app.Models;
using backend_app.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver.Core.Authentication;
using Route = backend_app.Models.Route;

namespace backend_app.Controllers
{
    [Route("TravelTopia/[controller]")]
    [ApiController]
    public class RouteController : Controller
    {
        private readonly RouteService routeService;
        private readonly UserService userService;

        public RouteController(RouteService routeService, UserService userService)
        {
            this.routeService = routeService;
            this.userService = userService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoute(Route route)
        {
            await routeService.CreateRouteAsync(route);

            return CreatedAtAction(nameof(GetRouteById), new { id = route.id }, route);
        }

        [HttpGet]
        public async Task<IActionResult> GetRoutes()
        {
            var routes = await routeService.GetRoutesAsync();

            return Ok(routes);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetListElementRoutes()
        {
            var routes = await routeService.GetListElementRoutesAsync();

            return Ok(routes);
        }

        [HttpGet("{text}/list")]
        public async Task<IActionResult> GetRoutesByString(string text)
        {
            var routes = await routeService.GetRoutesByStringAsync(text);

            return Ok(routes);
        }

        [HttpGet("NearPoint/{latitude}/{longitude}")]
        public async Task<IActionResult> GetRoutesByPoint(double latitude, double longitude)
        {
            var routes = await routeService.GetRoutesByPointAsync(latitude, longitude);

            return Ok(routes);
        }

        [HttpGet("id/{id}")]
        public async Task<IActionResult> GetRouteById(string id)
        {
            var route = await routeService.GetRouteByIdAsync(id);

            if (route == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(route);
            }
        }

        [HttpGet("list/id/{id}")]
        public async Task<IActionResult> GetRouteListElementById(string id)
        {
            var route = await routeService.GetRouteListElementByIdAsync(id);

            if (route == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(route);
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetFilteredRoutes([FromQuery] string? name = null, [FromQuery] string? type = null, [FromQuery] string? difficulty = null)
        {
            var routes = await routeService.GetFilteredRoutesAsync(name, type, difficulty);

            return Ok(routes);
        }

        [HttpGet("{name}")]
        public async Task<IActionResult> GetRoute(string name)
        {
            var route = await routeService.GetRouteAsync(name);

            if (route == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(route);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoute(string id)
        {
            if (await routeService.deleteRouteAsync(id))
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoute(string id, [FromBody] Route route)
        {
            if (await routeService.replaceRouteAsync(id, route))
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }
    }
}
