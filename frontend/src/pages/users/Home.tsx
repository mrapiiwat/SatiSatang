import useAuthStore from '../../store/authStore';

const Home = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <div className="text-gray-500 break-words">token: {token}</div>
      <div>id:{user?.id}</div>
      <div>name:{user?.name}</div>
      <div>email:{user?.email}</div>
      <div>balance:{user?.balance}</div>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae culpa cumque maiores labore
      dolorum, omnis veritatis? Dicta quibusdam natus rerum fugit odio eveniet nostrum quidem
      officiis delectus, doloremque modi corporis pariatur alias minima doloribus vel. Magni
      distinctio, minima exercitationem consequuntur beatae officia nisi repellendus odit assumenda,
      modi cupiditate. Laudantium corporis pariatur, dicta, facilis aliquid molestias, minus a
      delectus quibusdam placeat velit autem fuga eos! Aspernatur pariatur quaerat eius veniam, ipsa
      totam et illum sed quia voluptate omnis accusamus dicta cumque labore in itaque explicabo.
      Eum, quam! Aliquam, beatae maxime et molestias assumenda ea non voluptatem culpa impedit
      accusamus est similique sint? Assumenda nobis laboriosam repellendus, sit iusto nihil suscipit
      fuga illum aperiam iure dolor! Perferendis quidem incidunt suscipit, quia aliquid quos magnam
      veritatis excepturi asperiores at maiores qui reprehenderit quas, eligendi dolores dolore
      nihil eius. Tempore, officiis aliquam aliquid numquam adipisci, dicta ab cum accusamus ad a
      nisi rem consectetur beatae? Enim tenetur dolorem eius sunt rerum. Atque, numquam eaque non,
      dicta, inventore nostrum minima veniam velit fugit neque quod perspiciatis aspernatur
      consequuntur consequatur sed! Consequatur, ratione cumque nemo doloribus in quia natus
      perferendis accusantium iste. Blanditiis dicta illum repellendus alias consectetur aut
      voluptatum laboriosam. Saepe doloremque atque, reprehenderit nulla optio id nam, aut nesciunt
      explicabo corrupti omnis repudiandae molestias! Ab, doloribus velit sit, delectus iure ratione
      ipsam at soluta nulla, molestiae eius fugiat officia. Nihil deserunt minus perspiciatis illum
      illo nemo quod! Perspiciatis, perferendis tenetur, accusantium fugit obcaecati deserunt
      veritatis cumque incidunt natus ex ullam. Quae iure corrupti, qui est voluptatem cumque esse
      autem voluptate tempore nisi animi laborum quas in consequuntur et ab, minus soluta cupiditate
      at architecto harum fugit. Autem minima impedit recusandae adipisci numquam praesentium esse
      corrupti, veritatis mollitia omnis itaque repudiandae soluta explicabo voluptas molestias,
      dignissimos repellat excepturi unde harum sint qui alias fuga dicta. Et nihil autem
      voluptatum? Sint nemo tempore repellat delectus provident rerum saepe, eos asperiores vel
      obcaecati libero porro odit ut maiores suscipit temporibus atque nihil ex dicta debitis
      architecto harum neque! Quisquam, voluptate! Repellendus, cum? Minus, corrupti placeat.
      Dolore, illum. Exercitationem distinctio, dolorum eos reiciendis incidunt vero non animi
      quidem commodi voluptate, labore inventore quia tenetur explicabo? Incidunt porro impedit
      delectus corrupti, mollitia vero dolorum ex explicabo blanditiis beatae ipsum dignissimos
      laudantium, eaque assumenda! Libero tempora necessitatibus assumenda tempore suscipit
      asperiores maxime, facere repellat in dolor? Voluptates quo architecto neque esse explicabo
      facilis et fugiat ad saepe eos similique veritatis voluptatem tempora fugit non dolorem natus
      officiis officia rem, deleniti nam ipsam eveniet. Saepe, id provident sunt quaerat qui animi
      sit quia beatae, distinctio eius amet nesciunt magni eaque excepturi, aliquam cumque sint
      placeat laboriosam voluptas quod possimus. Quidem quasi provident, aliquid pariatur quas non
      earum. Aperiam ipsum sit sunt et accusamus in dolore, expedita facilis voluptatibus quia
      voluptates asperiores neque sint illo perspiciatis ex blanditiis ratione quibusdam quod
      laboriosam unde, quae dolorem. Omnis tempora amet aspernatur facilis neque recusandae et
      labore laudantium dolore similique, non accusantium? A dicta enim, quos earum fugit aliquid
      corporis, maiores cumque, commodi sint dignissimos?
    </>
  );
};

export default Home;
