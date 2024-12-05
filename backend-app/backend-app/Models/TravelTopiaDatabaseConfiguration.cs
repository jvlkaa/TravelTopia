namespace backend_app.Models
{
    public class TravelTopiaDatabaseConfiguration
    {
        public string ConnectionString {  get; set; }
        public string DatabaseName { get; set; }
        public string RouteCollectionName { get; set; }
        public string UserCollectionName { get; set; }
        public string TripCollectionName { get; set; }
    }
}
