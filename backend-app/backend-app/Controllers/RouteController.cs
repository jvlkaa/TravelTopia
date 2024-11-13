using backend_app.Dto;
using backend_app.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver.Core.Authentication;

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
        public async Task<IActionResult> Post(Models.Route route)
        {
            await routeService.CreateRouteAsync(route);
            return CreatedAtAction(nameof(Post), route);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetRoutes()
        {
            var routes = await routeService.GetRoutesAsync();
            if (routes == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(routes);
            }
        }

        [HttpGet("{text}/list")]
        public async Task<IActionResult> GetRoutesByString(string text)
        {
            var result = await routeService.GetRoutesByStringAsync(text);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("NearPoint/{latitude}/{longitude}")]
        public async Task<IActionResult> GetRoutesByPoint(double latitude, double longitude)
        {
            var result = await routeService.GetRoutesByPointAsync(latitude, longitude);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("id/{id}")]
        public async Task<IActionResult> GetRouteById(string id)
        {
            var result = await routeService.GetRouteByIdAsync(id);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("list/id/{id}")]
        public async Task<IActionResult> GetRouteListElementById(string id)
        {
            var result = await routeService.GetRouteListElementByIdAsync(id);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetFilteredRoutes([FromQuery] string? name = null, [FromQuery] string? type = null, [FromQuery] string? difficulty = null)
        {
            var result = await routeService.GetFilteredRoutesAsync(name, type, difficulty);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("{name}")]
        public async Task<IActionResult> GetRoute(string name)
        {
            var result = await routeService.GetRouteAsync(name);
            if (result == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoute(string id)
        {
            var result = await routeService.deleteRouteAsync(id);
            if (result)
            {
                return NoContent();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoute(string id, [FromBody] Models.Route route)
        {
            var result = await routeService.replaceRouteAsync(id, route);
            if (result)
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
