using Microsoft.AspNetCore.Mvc;
using backend_app.Services;
using backend_app.Models;
using MongoDB.Bson.IO;

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

        [HttpGet]
        public async Task<IActionResult> GetTrips()
        {
            var trips = await tripService.GetTripsAsync();
            if(trips == null)
            {
                return NotFound();
            }
            else
            {
                return Ok(trips);
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
    }
}
