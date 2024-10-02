using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend_app.Models
{
    public class Trip
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? id {  get; set; }

        [BsonElement("userCreated")]
        public bool userCreated { get; set; }

        [BsonElement("name")]
        public string name { get; set; }

        [BsonElement("description")]
        public string description { get; set; }

        [BsonElement("difficulty")]
        public string difficulty { get; set; }

        [BsonElement("routes")]
        public ICollection<string> routes {  get; set; }
    }
}
