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

            return CreatedAtAction(nameof(GetTripById), new { id = trip.id }, trip);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetTrips()
        {
            var trips = await tripService.GetTripsAsync();

            return Ok(trips);
        }

        [HttpGet("{name}")]
        public async Task<IActionResult> GetTrip(string name)
        {
            var trip = await tripService.GetTripAsync(name);

            if (trip == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(trip);
            }
        }

        [HttpGet("id/{id}")]
        public async Task<IActionResult> GetTripById(string id)
        {
            var trip = await tripService.GetTripByIdAsync(id);

            if (trip == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(trip);
            }
        }

        [HttpGet("list/id/{id}")]
        public async Task<IActionResult> GetTripListElementById(string id)
        {
            var trip = await tripService.GetTripListElementByIdAsync(id);

            if (trip == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(trip);
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetFilteredTrips([FromQuery] string? name = null, [FromQuery] string? difficulty = null)
        {
            var trips = await tripService.GetFilteredTripsAsync(name, difficulty);

            return Ok(trips);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(string id)
        {
            if (await tripService.DeleteTripAsync(id))
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
