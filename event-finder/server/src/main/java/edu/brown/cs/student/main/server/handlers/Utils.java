package edu.brown.cs.student.main.server.handlers;




import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import com.squareup.moshi.Types;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

public class Utils {

  public static String toMoshiJson(Map<String, Object> map) {
    Moshi moshi = new Moshi.Builder().build();
    Type mapStringObject = Types.newParameterizedType(Map.class, String.class, Object.class);
    JsonAdapter<Map<String, Object>> adapter = moshi.adapter(mapStringObject);

    return adapter.toJson(map);
  }

// to event JSON utils method
  public static String toJson(List<Event> events) {
    try {
      Moshi moshi = new Moshi.Builder().build();
      Type listOfEventsType = Types.newParameterizedType(List.class, Event.class);
      return moshi.adapter(listOfEventsType).toJson(events);
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }
}