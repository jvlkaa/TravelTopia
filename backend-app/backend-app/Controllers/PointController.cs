using backend_app.Models;
using backend_app.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend_app.Controllers
{
    [Route("TravelTopia/[controller]")]
    [ApiController]
    public class PointController : Controller
    {
        private readonly PointService _pointService;
        
        public PointController(PointService pointService) {
            this._pointService = pointService;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Point point)
        {
            await _pointService.CreatePointAsync(point);
            return CreatedAtAction(nameof(Post), point);
        }

        [HttpGet]
        public async Task<IActionResult> GetPoints()
        {
            var points = await _pointService.GetPointsAsync();
            return Ok(points);
        }

        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeletePoint(string id)
        //{
        //    var result = await _pointService.deletePointAsync(id);
        //    if (result)
        //    {
        //        return NoContent();
        //    }
        //    else
        //    {
        //        return NotFound();
        //    }
        //}

        //[HttpPut("{id}")]
        //public async Task<IActionResult> UpdatePoint(string id, [FromBody] Point point)
        //{
        //    var result = await _pointService.replacePointAsync(id, point);
        //    if (result)
        //    {
        //        return NoContent();
        //    }
        //    else
        //    {
        //        return NotFound();
        //    }
        //}

        //[HttpGet("{latitude}/{longitude}")]
        //public async Task<IActionResult> GetPointId(double latitude, double longitude)
        //{
        //    var result = await _pointService.getPointIdAsync(latitude, longitude);
        //    if(result != null)
        //    {
        //        return Ok(result);
        //    }
        //    else
        //    {
        //        return NotFound();
        //    }
        //}

    }
}
