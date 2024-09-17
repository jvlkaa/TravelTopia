using backend_app.Models;

namespace backend_app.Dto
{
    public class AddUserRoute
    {
        public string name { get; set; }
        public ICollection<Point> routePoints {  get; set; }        
        public bool userCreated {  get; set; }
        public string type { get; set; }
        public string equipment { get; set; }
        public string difficulty { get; set; }
        public string description { get; set; }
        public int time { get; set; }
        public string userIdToken {  get; set; }

    }
}
