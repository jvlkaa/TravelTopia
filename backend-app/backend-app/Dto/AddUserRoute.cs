using backend_app.Models;

namespace backend_app.Dto
{
    public class AddUserRoute
    {
        public string id { get; set; }
        public string name { get; set; }
        public ICollection<Point> routePoints {  get; set; }        
        public bool userCreated {  get; set; }
        public string type { get; set; }
        public string userIdToken {  get; set; }

    }
}
