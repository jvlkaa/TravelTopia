namespace backend_app.Dto
{
    public class AddUserTrip
    {
        public bool userCreated {  get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public string difficulty { get; set; }
        public ICollection<string> routes { get; set; }
        public string userIdToken { get; set; }
    }
}
