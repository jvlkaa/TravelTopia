﻿using backend_app.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson.Serialization.Serializers;

namespace backend_app.Controllers
{
    [Route("TravelTopia/[controller]")]
    [ApiController]
    public class RouteController : Controller
    {
        private readonly RouteService routeService;

        public RouteController(RouteService routeService)
        {
            this.routeService = routeService;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Models.Route route)
        {
            await routeService.CreateRouteAsync(route);
            return CreatedAtAction(nameof(Post), route);
        }

        [HttpGet]
        public async Task<IActionResult> GetRoutes()
        {
            var routes = await routeService.GetRoutesAsync();
            return Ok(routes);
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

        [HttpGet("{name}")]
        public async Task<IActionResult> GetRoute(string name)
        {
            var result = await routeService.GetRouteAsync(name);
            if(result == null)
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
            var result =  await routeService.replaceRouteAsync(id, route);
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