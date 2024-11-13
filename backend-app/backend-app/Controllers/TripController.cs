using Microsoft.AspNetCore.Mvc;
using backend_app.Services;
using backend_app.Models;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend_app.Controllers
{
    [Route("TravelTopia/[controller]")]
    [ApiController]
    public class TripController : Controller
    {
        private readonly TripService tripService;

        public TripController(TripService tripService)
        {
            this.tripService = tripService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTrip(Trip trip)
        {
            await this.tripService.CreateTripAsync(trip);
            return CreatedAtAction(nameof(CreateTrip), trip);

        }

        [HttpGet("list")]
        public async Task<IActionResult> GetTrips()
        {
            var trips = await tripService.GetTripsAsync();
            if (trips == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(trips);
            }
        }

        [HttpGet("{name}")]
        public async Task<IActionResult> GetTrip(string name)
        {
            var result = await tripService.GetTripAsync(name);
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
        public async Task<IActionResult> GetTripById(string id)
        {
            var result = await tripService.GetTripByIdAsync(id);
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
        public async Task<IActionResult> GetTripListElementById(string id)
        {
            var result = await tripService.GetTripListElementByIdAsync(id);
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
        public async Task<IActionResult> GetFilteredTrips([FromQuery] string? name = null, [FromQuery] string? difficulty = null)
        {
            var result = await tripService.GetFilteredTripsAsync(name, difficulty);
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
        public async Task<IActionResult> DeleteTrip(string id)
        {
            var result = await tripService.deleteTripAsync(id);
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
