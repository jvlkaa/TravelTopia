using Microsoft.AspNetCore.Mvc;
using backend_app.Services;
using backend_app.Models;

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
    }
}
