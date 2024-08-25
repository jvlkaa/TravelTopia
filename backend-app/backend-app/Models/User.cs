using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend_app.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string id { get; set; }

        [BsonElement("googleId")]
        public string googleId { get; set; }

        [BsonElement("firstName")]
        public string firstName { get; set; }
        
        [BsonElement("lastName")]
        public string lastName { get; set; }

        [BsonElement("email")]
        public string email { get; set; }

        [BsonElement("routes")]
        public ICollection<string> routesIds { get; set; } = new List<string>();
    }
}
